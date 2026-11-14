import { handleTwilioWitness } from '../_shared/twilio-witness.ts';
Deno.serve((request: Request) => handleTwilioWitness(request, Deno.env));
