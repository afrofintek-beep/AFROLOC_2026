import {handleFair} from '../_shared/fair-verification.ts';
Deno.serve((request: Request) => handleFair(request,Deno.env));
