import { NextResponse } from 'next/server';

export async function GET() {
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: 'TMDB_API_KEY is not configured' }, { status: 500 });
    }

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}&language=en-US&page=1`
        );

        if (!response.ok) {
            throw new Error(`TMDB API responded with ${response.status}`);
        }

        const data = await response.json();

        // Extract just the titles
        const movies = data.results.slice(0, 10).map((m: any) => m.title);

        return NextResponse.json({ movies });
    } catch (error) {
        console.error('Error fetching movies:', error);
        return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
    }
}
