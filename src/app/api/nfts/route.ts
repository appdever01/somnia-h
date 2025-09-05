import { NextResponse } from 'next/server';
import axios from 'axios';

type NFTCollection = {
  token: {
    address: string;
  };
  token_instances?: Array<{
    token_id: string;
    animation_url: string;
    name: string;
  }>;
  amount?: number;
};

type APIResponse = {
  items: NFTCollection[];
};

export async function POST(req: Request) {
  const { address } = await req.json();
  if (!address) return NextResponse.json({
    error: 'Missing address'
  }, { status: 400 });

  try {
    const { data } = await axios.get<APIResponse>(`https://somnia.w3us.site/api/v2/addresses/${address}/nft/collections?type=ERC-721%2CERC-404%2CERC-1155`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!data.items || !Array.isArray(data.items)) {
      return NextResponse.json({
        token_instances: [],
        amount: 0
      });
    }
    const filteredData = data.items.filter((collection: {
      token: { address: string }
    }) => {
      return collection.token.address === "0xA9328313424aFB38597814724AD3B66Ba2c0ae3c"
    });
    if (!filteredData.length) {
      return NextResponse.json({
        token_instances: [],
        amount: 0
      });
    }
    const pumpazNFTData = filteredData[0];
    if (!pumpazNFTData) {
      return NextResponse.json({
        token_instances: [],
        amount: 0
      });
    }
    return NextResponse.json(pumpazNFTData);
  } catch (err: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    return NextResponse.json({
      error: 'Failed to fetch NFTs',
      details: {
        name: err.name,
        message: err.message,
        code: err.code,
        status: err.response?.status
      }
    }, { status: 500 });
  }
}