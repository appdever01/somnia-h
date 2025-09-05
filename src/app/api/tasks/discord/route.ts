import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
    const { address, discordUsername } = await req.json();

    try {
        const response = await axios.post(
            `${process.env.API_BASE_URL}/users/update-discord`,
            {
                "address": address,
                "discordUsername": discordUsername,
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
        console.error("Failed to update discord: ", error);
        return NextResponse.json({ 
            code: 500, 
            status: false, 
            message: 'Failed to update discord',
            data: null
        }, { status: 500 });
    }
}