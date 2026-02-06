'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PaymentModal from '@/components/PaymentModal';
import {
  registrationApi,
  RegistrationCategory,
  FormInputGroup,
} from '@/lib/api';
import {
  initializePayment,
  processPayment,
  requiresPayment,
  parseFeeAmount,
  extractCurrency,
  PaymentResult,
  PaymentSession,
} from '@/lib/payment';

type AttendanceType = 'PHYSICAL' | 'VIRTUAL';

interface FormValues {
  [key: string]: string | string[];
}

export default function RegisterConferencePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventType, setEventType] = useState<
    'HYBRID' | 'PHYSICAL' | 'VIRTUAL' | null
  >(null);
  const [attendanceType, setAttendanceType] = useState<AttendanceType | null>(
    null,
  );
  const [categories, setCategories] = useState<RegistrationCategory[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<RegistrationCategory | null>(null);
  const [formGroups, setFormGroups] = useState<FormInputGroup[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState<FormValues>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [paymentData, setPaymentData] = useState({
    orderId: '',
    paymentToken: '',
    paymentSession: '',
    transactionId: '',
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null);

  useEffect(() => {
    loadRegistrationPage();
  }, []);

  const loadRegistrationPage = async () => {
    setLoading(true);
    try {
      const response = await registrationApi.getRegistrationPage();
      setEventType(response.event_description.event_type);

      // If not hybrid, automatically set attendance type and load categories
      if (response.event_description.event_type !== 'HYBRID') {
        setAttendanceType(
          response.event_description.event_type as AttendanceType,
        );
        await loadCategories(
          response.event_description.event_type as AttendanceType,
        );
      }
    } catch (err) {
      setError('Failed to load registration page');
      console.error(err);
    }
    setLoading(false);
  };

  const loadCategories = async (type: AttendanceType) => {
    setLoading(true);
    try {
      const response = await registrationApi.getCategories(type);
      setCategories(response.data || []);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    }
    setLoading(false);
  };

  const selectAttendance = async (type: AttendanceType) => {
    setAttendanceType(type);
    await loadCategories(type);
  };

  const selectCategory = async (category: RegistrationCategory) => {
    setSelectedCategory(category);
    setLoading(true);

    // Check if payment is required
    const needsPayment = requiresPayment(category.fee);
    setPaymentRequired(needsPayment);

    // Generate order ID if payment is required
    if (needsPayment) {
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      setPaymentData(prev => ({ ...prev, orderId }));
    }

    try {
      const response = await registrationApi.getCategoryForm(
        category.id,
        attendanceType!,
      );
      setFormGroups(response.data || []);
      setCurrentStep(0);
    } catch (err) {
      setError('Failed to load registration form');
      console.error(err);
    }
    setLoading(false);
  };

  const handleInputChange = (inputCode: string, value: string | string[]) => {
    setFormValues((prev) => ({
      ...prev,
      [inputCode]: value,
    }));
  };

  const validateStep = useCallback(() => {
    const currentGroup = formGroups[currentStep];
    if (!currentGroup) return true;

    const errors: string[] = [];
    currentGroup.inputs.forEach(({ input }) => {
      if (input.is_mandatory === 'YES') {
        const value = formValues[input.inputcode];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          errors.push(`${input.nameEnglish} is required`);
        }
      }
    });

    setFormErrors(errors);
    return errors.length === 0;
  }, [currentStep, formGroups, formValues]);

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, formGroups.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    if (!selectedCategory) {
      setFormErrors(['Please select a category before submitting']);
      return;
    }

    setSubmitting(true);
    setFormErrors([]);

    try {
      // Process payment if required
      let paymentResult: PaymentResult | null = null;

      if (paymentRequired && selectedCategory) {
        setProcessingPayment(true);

        // Get customer info from form
        const customerEmail = (formValues['input_id_52307'] as string) || '';
        const firstName = (formValues['input_id_21576'] as string) || '';
        const lastName = (formValues['input_id_35129'] as string) || '';

        if (!customerEmail) {
          setFormErrors(['Email is required for payment processing']);
          setSubmitting(false);
          setProcessingPayment(false);
          return;
        }

        // Initialize payment
        const paymentSession = await initializePayment({
          orderId: paymentData.orderId,
          amount: parseFeeAmount(selectedCategory.fee),
          currency: extractCurrency(selectedCategory.fee),
          categoryName: selectedCategory.name_english,
          categoryId: selectedCategory.id,
          attendenceType: attendanceType || 'PHYSICAL',
          customerEmail,
          customerName: `${firstName} ${lastName}`.trim(),
        });

        if (!paymentSession) {
          setFormErrors(['Failed to initialize payment. Please try again.']);
          setSubmitting(false);
          setProcessingPayment(false);
          return;
        }

        // Store payment session and show modal
        setPaymentSession(paymentSession);
        setShowPaymentModal(true);
        setProcessingPayment(false);

        // Setup payment callback
        const paymentPromise = processPayment(paymentSession, {
          orderId: paymentData.orderId,
          amount: parseFeeAmount(selectedCategory.fee),
          currency: extractCurrency(selectedCategory.fee),
          categoryName: selectedCategory.name_english,
          categoryId: selectedCategory.id,
          attendenceType: attendanceType || 'PHYSICAL',
          customerEmail,
          customerName: `${firstName} ${lastName}`.trim(),
        });

        // Wait for payment result
        paymentResult = await paymentPromise;

        // Close modal
        setShowPaymentModal(false);

        if (!paymentResult.success) {
          setFormErrors([
            paymentResult.error || 'Payment was not completed. Please try again.',
          ]);
          setSubmitting(false);
          return;
        }

        // Update payment data
        setPaymentData({
          orderId: paymentResult.orderId,
          paymentToken: paymentResult.paymentToken || '',
          paymentSession: paymentResult.paymentSession || '',
          transactionId: paymentResult.transactionId || '',
        });
      }

      // Prepare registration data
      const formData = new FormData();
      const delegateData: Array<{
        input_code: string;
        input_type: string;
        input_value: string;
        input_name: string;
      }> = [];

      formGroups.forEach((group) => {
        group.inputs.forEach(({ input }) => {
          const value = formValues[input.inputcode];
          if (value) {
            const valueStr = Array.isArray(value) ? value.join(', ') : value;
            delegateData.push({
              input_code: input.inputcode,
              input_type: String(input.inputtype.id),
              input_value: valueStr,
              input_name: input.nameEnglish,
            });

            // Special fields for registration
            if (input.inputcode === 'input_id_52307') {
              formData.append('registration_email', valueStr);
            }
            if (input.inputcode === 'input_id_21576') {
              formData.append('first_name', valueStr);
            }
            if (input.inputcode === 'input_id_35129') {
              formData.append('last_name', valueStr);
            }
          }
        });
      });

      formData.append('delegate_data', JSON.stringify(delegateData));
      formData.append('ticket_id', String(selectedCategory.id));
      formData.append('attendence_type', attendanceType || 'PHYSICAL');
      formData.append('user_language', 'english');
      formData.append('accompanied', 'NO');

      // Add payment data if payment was processed
      if (paymentResult && paymentResult.success) {
        formData.append('order_id', paymentResult.orderId);
        formData.append('payment_token', paymentResult.paymentToken || '');
        formData.append('payment_session', paymentResult.paymentSession || '');
        formData.append('acknowleadgment', paymentResult.transactionId || '');
      } else {
        formData.append('order_id', '');
        formData.append('payment_token', '');
        formData.append('payment_session', '');
        formData.append('acknowleadgment', '');
      }

      const response = await registrationApi.submitRegistration(formData);

      if (response.message) {
        setSubmitted(true);
      }
    } catch (err) {
      setFormErrors(['Failed to submit registration. Please try again.']);
      console.error(err);
    }
    setSubmitting(false);
  };

  const renderInput = (
    input: FormInputGroup['inputs'][0]['input'],
    options: FormInputGroup['inputs'][0]['options'],
    value: string,
  ) => {
    const inputValue = formValues[input.inputcode] || value || '';
    const isRequired = input.is_mandatory === 'YES';

    switch (input.inputtype.id) {
      case 1: // Text
        return (
          <input
            type="text"
            id={input.inputcode}
            value={inputValue as string}
            onChange={(e) => handleInputChange(input.inputcode, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required={isRequired}
          />
        );

      case 2: // Select
        return (
          <select
            id={input.inputcode}
            value={inputValue as string}
            onChange={(e) => handleInputChange(input.inputcode, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required={isRequired}
          >
            <option value="">Select...</option>
            {options.map((option) => (
              <option key={option.id} value={option.contentEnglish}>
                {option.contentEnglish}
              </option>
            ))}
          </select>
        );

      case 4: // Date
        return (
          <input
            type="date"
            id={input.inputcode}
            value={inputValue as string}
            onChange={(e) => handleInputChange(input.inputcode, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required={isRequired}
          />
        );

      case 5: // Email
        return (
          <input
            type="email"
            id={input.inputcode}
            value={inputValue as string}
            onChange={(e) => handleInputChange(input.inputcode, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required={isRequired}
          />
        );

      case 8: // Number
        return (
          <input
            type="number"
            id={input.inputcode}
            value={inputValue as string}
            onChange={(e) => handleInputChange(input.inputcode, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required={isRequired}
          />
        );

      case 12: // Phone
        return (
          <input
            type="tel"
            id={input.inputcode}
            value={inputValue as string}
            onChange={(e) => handleInputChange(input.inputcode, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required={isRequired}
          />
        );

      case 15: // Textarea
        return (
          <textarea
            id={input.inputcode}
            value={inputValue as string}
            onChange={(e) => handleInputChange(input.inputcode, e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required={isRequired}
          />
        );

      case 10: // Radio
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <label key={option.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={input.inputcode}
                  value={option.contentEnglish}
                  checked={inputValue === option.contentEnglish}
                  onChange={(e) =>
                    handleInputChange(input.inputcode, e.target.value)
                  }
                  className="w-4 h-4 text-primary-500"
                  required={isRequired}
                />
                <span>{option.contentEnglish}</span>
              </label>
            ))}
          </div>
        );

      case 16: // Checkbox (multiple)
        return (
          <div className="space-y-2">
            {options.map((option) => (
              <label key={option.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={option.contentEnglish}
                  checked={
                    Array.isArray(inputValue)
                      ? inputValue.includes(option.contentEnglish)
                      : inputValue === option.contentEnglish
                  }
                  onChange={(e) => {
                    const current = Array.isArray(inputValue)
                      ? inputValue
                      : inputValue
                        ? [inputValue]
                        : [];
                    if (e.target.checked) {
                      handleInputChange(input.inputcode, [
                        ...current,
                        e.target.value,
                      ]);
                    } else {
                      handleInputChange(
                        input.inputcode,
                        current.filter((v) => v !== e.target.value),
                      );
                    }
                  }}
                  className="w-4 h-4 text-primary-500"
                />
                <span>{option.contentEnglish}</span>
              </label>
            ))}
          </div>
        );

      case 17: // Paragraph (display only)
        return (
          <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
            {input.nameEnglish}
          </p>
        );

      default:
        return (
          <input
            type="text"
            id={input.inputcode}
            value={inputValue as string}
            onChange={(e) => handleInputChange(input.inputcode, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required={isRequired}
          />
        );
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 to-primary-100">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Registration {paymentData.transactionId ? 'and Payment' : ''} Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for registering for the conference. You will receive a
              confirmation email shortly.
            </p>

            {/* Payment Details */}
            {paymentData.transactionId && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-left">
                <h3 className="text-sm font-semibold text-green-800 mb-3">
                  Payment Details
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono font-medium">
                      {paymentData.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-mono font-medium">
                      {paymentData.orderId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Paid
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  A receipt has been sent to your email address.
                </p>
              </div>
            )}

            <Link
              href="/"
              className="inline-block bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 transition-colors mt-6"
            >
              Back to Home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 to-primary-100">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>
          </div>

          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-primary-700 mb-2">
              Conference Registration
            </h1>
            <p className="text-gray-600">
              Register to attend the MedEdAfrica2026
            </p>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading registration form...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadRegistrationPage}
                className="mt-4 bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600"
              >
                Try Again
              </button>
            </div>
          ) : eventType === 'HYBRID' && !attendanceType ? (
            /* Attendance Type Selection */
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-xl font-semibold text-center mb-6">
                Select Your Attendance Type
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => selectAttendance('PHYSICAL')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Physical Attendance
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Attend the event in person at the venue
                  </p>
                </button>
                <button
                  onClick={() => selectAttendance('VIRTUAL')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-center"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Virtual Attendance
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Attend the event online from anywhere
                  </p>
                </button>
              </div>
            </div>
          ) : !selectedCategory ? (
            /* Category Selection */
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  Select Registration Category
                </h2>
                {eventType === 'HYBRID' && (
                  <button
                    onClick={() => setAttendanceType(null)}
                    className="text-primary-600 hover:text-primary-700 text-sm"
                  >
                    Change attendance type
                  </button>
                )}
              </div>
              {categories.length === 0 ? (
                <p className="text-gray-600 text-center py-8">
                  No registration categories available at this time.
                </p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => {
                    const isFree = !requiresPayment(category.fee);
                    return (
                      <div
                        key={category.id}
                        className="border-2 border-gray-200 rounded-xl p-6 hover:border-primary-500 hover:shadow-lg transition-all relative overflow-hidden"
                      >
                        {isFree && (
                          <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            FREE
                          </div>
                        )}
                        <h3 className="text-lg font-semibold mb-2">
                          {category.name_english}
                        </h3>
                        <p className={`text-2xl font-bold mb-4 ${isFree ? 'text-green-600' : 'text-primary-600'}`}>
                          {category.fee}
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                          {category.early_payment_date
                            ? `Early bird ends: ${category.early_payment_date}`
                            : `Registration closes: ${category.end_date}`}
                        </p>
                        <button
                          onClick={() => selectCategory(category)}
                          className={`w-full py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                            isFree
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : 'bg-primary-500 text-white hover:bg-primary-600'
                          }`}
                        >
                          {!isFree && (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                              />
                            </svg>
                          )}
                          Register
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Registration Form */
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Form Steps */}
              {formGroups.length > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex gap-2 overflow-x-auto">
                    {formGroups.map((group, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (index < currentStep) setCurrentStep(index);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                          index === currentStep
                            ? 'bg-primary-500 text-white'
                            : index < currentStep
                              ? 'bg-primary-100 text-primary-700'
                              : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {group.group.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-6">
                {formErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <ul className="list-disc list-inside text-red-600 text-sm">
                      {formErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {formGroups[currentStep] && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {formGroups[currentStep].group.name}
                    </h3>
                    {formGroups[currentStep].inputs.map(
                      ({ input, options, value }) => (
                        <div key={input.inputcode}>
                          {input.inputtype.id !== 17 && (
                            <label
                              htmlFor={input.inputcode}
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              {input.nameEnglish}
                              {input.is_mandatory === 'YES' && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </label>
                          )}
                          {renderInput(input, options, value)}
                        </div>
                      ),
                    )}
                  </div>
                )}

                {/* Payment Processing Indicator */}
                {processingPayment && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Processing Payment
                        </p>
                        <p className="text-xs text-blue-600">
                          Please complete the payment in the popup window...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Required Notice */}
                {paymentRequired && selectedCategory && currentStep === formGroups.length - 1 && !processingPayment && (
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800 mb-1">
                          Payment Required
                        </p>
                        <p className="text-sm text-amber-700">
                          Registration fee: <span className="font-semibold">{selectedCategory.fee}</span>
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          You will be redirected to a secure payment page after clicking Submit.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <div>
                    {currentStep > 0 ? (
                      <button
                        type="button"
                        onClick={prevStep}
                        disabled={submitting || processingPayment}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(null)}
                        disabled={submitting || processingPayment}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Change Category
                      </button>
                    )}
                  </div>
                  <div>
                    {currentStep < formGroups.length - 1 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={submitting || processingPayment}
                        className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={submitting || processingPayment}
                        className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {processingPayment ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Processing Payment...
                          </>
                        ) : submitting ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            {paymentRequired && (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                />
                              </svg>
                            )}
                            {paymentRequired ? 'Proceed to Payment' : 'Submit Registration'}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Mastercard Payment Modal */}
      {paymentSession && (
        <PaymentModal
          session={paymentSession}
          amount={parseFeeAmount(selectedCategory?.fee || '0')}
          currency={extractCurrency(selectedCategory?.fee || 'USD')}
          categoryName={selectedCategory?.name_english || ''}
          customerEmail={(formValues['input_id_52307'] as string) || ''}
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setProcessingPayment(false);
            setSubmitting(false);
          }}
        />
      )}
    </div>
  );
}
