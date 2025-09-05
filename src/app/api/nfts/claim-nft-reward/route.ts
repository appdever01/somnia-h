import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  const { address } = await req.json();
  if (!address) return NextResponse.json({
    error: 'Missing address'
  }, { status: 400 });

  try {
    const{ data } = await axios.post("https://testnet-admin.somniapumpaz.xyz/api/claim-nft-reward", {
        "address": address,
    }, {
        headers: {
            Authorization: `Bearer ${process.env.NFT_BEARER_TOKEN}`,
            'Content-Type': 'application/json',
        }
    })
    return NextResponse.json(data)
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