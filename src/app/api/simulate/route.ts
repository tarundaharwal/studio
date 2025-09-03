
import { NextRequest, NextResponse } from 'next/server';
import { runSimulation, SimulationOutput } from '@/ai/flows/simulation-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // The 'run' function from Genkit executes the flow.
    // The body now contains the full frontend state, including the session.
    const newState: SimulationOutput = await runSimulation(body);

    // Pass the current time and the incremented tick counter back to the client.
    return NextResponse.json({ ...newState, lastTickTime: Date.now(), tickCounter: body.tickCounter + 1 });

  } catch (error: any) {
    console.error("API Route Error:", error);
    // If the error is an auth error from the service, pass it with a 401 status
    if (error.message.includes('Invalid session')) {
        return NextResponse.json({ message: "Authentication Error", error: error.message }, { status: 401 });
    }
    return NextResponse.json({ message: "Error running simulation", error: error.message }, { status: 500 });
  }
}
