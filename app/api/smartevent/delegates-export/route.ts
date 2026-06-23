import { NextResponse } from 'next/server';

const SMARTEVENT_BASE = 'https://app.smartevent.rw/Api';
const EVENT_CODE = '69848109c25ca';
const NUM_COLUMNS = 21;

export async function POST() {
  try {
    const params = new URLSearchParams();
    params.append('draw', '1');

    for (let i = 0; i < NUM_COLUMNS; i++) {
      params.append(`columns[${i}][data]`, String(i));
      params.append(`columns[${i}][name]`, '');
      params.append(`columns[${i}][searchable]`, 'true');
      params.append(`columns[${i}][orderable]`, 'true');
      params.append(`columns[${i}][search][value]`, '');
      params.append(`columns[${i}][search][regex]`, 'false');
    }

    params.append('order[0][column]', '0');
    params.append('order[0][dir]', 'asc');
    params.append('start', '0');
    params.append('length', '-1');
    params.append('search[value]', '');
    params.append('search[regex]', 'false');
    params.append('export', 'true');
    params.append('reg_status', '[]');

    const response = await fetch(
      `${SMARTEVENT_BASE}/Delegates-Data/Get_Delegates_List_Full/${EVENT_CODE}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      },
    );

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return NextResponse.json({ message: String(error) }, { status: 500 });
  }
}
