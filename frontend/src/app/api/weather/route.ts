import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');

        if (!lat || !lng) {
            return NextResponse.json(
                { error: 'Latitude and Longitude are required' },
                { status: 400 }
            );
        }

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`
        );

        if (!response.ok) {
            throw new Error('Weather API request failed');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching weather:', error);
        return NextResponse.json(
            { error: 'Failed to fetch weather data' },
            { status: 500 }
        );
    }
}
