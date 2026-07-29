<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Allow the request through only when the signed-in user holds one of the
     * given roles. Usage in routes: ->middleware('role:admin,hr')
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if(! $request->user() || ! $request->user()->hasRole(...$roles)){
            abort(403, 'You do not have permission to access this area.');
        }
        
        return $next($request);
    }
}
