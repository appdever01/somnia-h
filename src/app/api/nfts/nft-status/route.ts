import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  const { address } = await req.json();
  if (!address) return NextResponse.json({
    error: 'Missing address'
  }, { status: 400 });

  try {
    const { data } = await axios.get(`https://testnet-admin.somniapumpaz.xyz/api/get-nft-claim-status/${address}`, {
        headers: {
            Authorization: `Bearer ${process.env.NFT_BEARER_TOKEN}`,
            'Content-Type': 'application/json',
        }
    })

    return NextResponse.json(data)
  } catch (error) {
      console.error("Failed to get claim status: ", error);
      return NextResponse.json({ 
        code: 500, 
        status: false, 
        message: 'Failed to claim',
        data: null
      }, { status: 500 });
  }
}