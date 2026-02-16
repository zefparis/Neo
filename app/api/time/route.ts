import { NextRequest, NextResponse } from 'next/server';

interface TimeResponse {
  datetime: string;
  timezone: string;
  utc_offset: string;
  abbreviation: string;
  day_of_week: number;
  day_of_year: number;
  dst: boolean;
  dst_from: string | null;
  dst_offset: number;
  dst_until: string | null;
  raw_offset: number;
  unixtime: number;
  utc_datetime: string;
  week_number: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const timezone = searchParams.get('timezone');

  if (!timezone) {
    return NextResponse.json({ error: 'Timezone is required' }, { status: 400 });
  }

  try {
    // Tentative de récupération depuis worldtimeapi.org
    const response = await fetch(`https://worldtimeapi.org/api/timezone/${timezone}`, {
      next: { revalidate: 60 }, // Cache pendant 60 secondes
      headers: {
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data: TimeResponse = await response.json();
      return NextResponse.json(data);
    }
    
    // Fallback si l'API échoue
    console.warn(`WorldTimeAPI fetch failed for ${timezone}, falling back to local calculation.`);
    throw new Error('API request failed');
  } catch (error) {
    // Calcul local en cas d'erreur ou d'échec de fetch
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZoneName: 'shortOffset'
      });

      const parts = formatter.formatToParts(now);
      const part = (type: string) => parts.find(p => p.type === type)?.value || '';

      // Reconstruction format ISO 8601 approximatif pour correspondre à la structure
      const year = part('year');
      const month = part('month');
      const day = part('day');
      const hour = part('hour');
      const minute = part('minute');
      const second = part('second');
      const timeZoneName = part('timeZoneName'); // Ex: "GMT+2" ou "GMT-5"
      
      // Extraction de l'offset
      let utc_offset = "+00:00";
      if (timeZoneName.includes('GMT') || timeZoneName.includes('UTC')) {
        const offsetMatch = timeZoneName.match(/([+-]\d+)/);
        if (offsetMatch) {
            // Intl renvoie souvent GMT+1 ou GMT-5 sans les minutes si c'est pile.
            // On va essayer de normaliser ça.
            // Note: C'est un fallback, donc on fait au mieux.
            const offsetNum = parseInt(offsetMatch[1]);
            const sign = offsetNum >= 0 ? '+' : '-';
            const absOffset = Math.abs(offsetNum);
            utc_offset = `${sign}${absOffset.toString().padStart(2, '0')}:00`;
        }
      }

      const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}${utc_offset}`;

      return NextResponse.json({
        datetime: isoString,
        timezone: timezone,
        utc_offset: utc_offset,
        // Champs manquants pour un fallback complet mais suffisants pour l'affichage de base
        abbreviation: timeZoneName,
        unixtime: Math.floor(now.getTime() / 1000),
        is_fallback: true
      });

    } catch (localError) {
      console.error(`Local fallback failed for ${timezone}:`, localError);
      return NextResponse.json({ error: 'Failed to fetch time data', details: String(localError) }, { status: 500 });
    }
  }
}
