import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
    const { address } = await req.json();

    try {
        const response = await axios.post(
            `${process.env.API_BASE_URL}/users/claim`,
            {
                "address": address,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.API_BEARER_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        return NextResponse.json(response.data)
    } catch (error) {
        console.error("Failed to claim: ", error);
        return NextResponse.json({ 
            code: 500, 
            status: false, 
            message: 'Failed to claim',
            data: null
        }, { status: 500 });
    }
}