<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\TicketController;
use App\Http\Controllers\EventController;


// Ticket routes (event-nested). Note: the controller does not implement an
// `index` method, so there is no listing route here. All controller methods
// expect an event id as the first parameter.
Route::post('/events/{event}/tickets', [TicketController::class, 'store']);
Route::get('/events/{event}/tickets/{ticket}', [TicketController::class, 'show']);
Route::put('/events/{event}/tickets/{ticket}', [TicketController::class, 'update']);
Route::delete('/events/{event}/tickets/{ticket}', [TicketController::class, 'destroy']);
Route::post('/events/{event}/tickets/{ticket}/reserve', [TicketController::class, 'reserve']);


Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);


/*
 below are commented examples
| showing how these routes could be protected (e.g. with Sanctum or auth:api).
| Uncomment and adjust when you're ready. Note the event-nested paths.
|
| Route::middleware('auth:sanctum')->group(function () {
|     Route::post('/events/{event}/tickets', [TicketController::class, 'store']);
|     Route::put('/events/{event}/tickets/{ticket}', [TicketController::class, 'update']);
|     Route::delete('/events/{event}/tickets/{ticket}', [TicketController::class, 'destroy']);
| });
*/

