
import { NextRequest, NextResponse } from 'next/server';
import { runSimulation, SimulationOutput } from '@/ai/flows/simulation-flow';
import { useStore } from '@/store/use-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // The 'run' function from Genkit executes the flow
    const newState: SimulationOutput = await runSimulation(body);

    // If the backend has just processed an emergency stop, update the frontend's status
    if (body.tradingStatus === 'EMERGENCY_STOP' && newState.tradingStatus === 'STOPPED') {
        useStore.getState().toggleTradingStatus(); // This will correctly set it to STOPPED on the client.
    }


    // Pass the current time back to the client so it knows when the tick was processed
    return NextResponse.json({ ...newState, lastTickTime: Date.now() });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ message: "Error running simulation", error: error.message }, { status: 500 });
  }
}
