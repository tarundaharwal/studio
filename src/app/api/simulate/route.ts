
import { NextRequest, NextResponse } from 'next/server';
import { run } from '@genkit-ai/next';
import { simulationFlow } from '@/ai/flows/simulation-flow';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // The 'run' function from Genkit executes the flow
    const newState = await run(simulationFlow, body);

    return NextResponse.json(newState);
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse