
import { NextRequest, NextResponse } from 'next/server';
import { runSimulation } from '@/ai/flows/simulation-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // The 'run' function from Genkit executes the flow
    const newState = await runSimulation(body);

    return NextResponse.json(newState);
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ message: "Error running simulation", error: error.message }, { status: 500 });
  }
}
