<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\EventController;

// Authentication routes (public)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected authentication routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);

    // Booking routes
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/upcoming', [BookingController::class, 'upcoming']);
    Route::get('/bookings/past', [BookingController::class, 'past']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);

    // Favorite routes
    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites/{eventId}', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{eventId}', [FavoriteController::class, 'destroy']);
    Route::get('/favorites/{eventId}/check', [FavoriteController::class, 'check']);
});


// Ticket routes (event-nested). All controller methods
// expect an event id as the first parameter.
Route::get('/events/{event}/tickets', [TicketController::class, 'index']);
Route::get('/events/{event}/tickets/{ticket}', [TicketController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/events/{event}/tickets', [TicketController::class, 'store']);
    Route::put('/events/{event}/tickets/{ticket}', [TicketController::class, 'update']);
    Route::delete('/events/{event}/tickets/{ticket}', [TicketController::class, 'destroy']);
    Route::post('/events/{event}/tickets/{ticket}/reserve', [TicketController::class, 'reserve']);
});


Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
});


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

