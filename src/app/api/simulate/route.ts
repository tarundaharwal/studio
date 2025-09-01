
import { NextRequest, NextResponse } from 'next/server';
import { runSimulation, SimulationOutput } from '@/ai/flows/simulation-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // The 'run' function from Genkit executes the flow
    const newState: SimulationOutput = await runSimulation(body);

    // Pass the current time back to the client so it knows when the tick was processed
    return NextResponse.json({ ...newState, lastTickTime: Date.now() });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ message: "Error running simulation", error: error.message }, { status: 500 });
  }
}
