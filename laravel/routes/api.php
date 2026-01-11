<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\EventController;

// Use the "web" middleware so sessions + CSRF are enabled for these API routes.
Route::middleware('web')->group(function () {
    // CSRF bootstrap for SPA clients
    Route::get('/csrf', function (Request $request) {
        $token = csrf_token();

        return response()
            ->json(['csrf_token' => $token])
            ->cookie(
                'XSRF-TOKEN',
                $token,
                0,
                '/',
                config('session.domain'),
                (bool) config('session.secure', false),
                false,
                false,
                'None'
            );
    });

    // Authentication routes (session-based)
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Public reads
    Route::get('/events', [EventController::class, 'index']);
    Route::get('/events/{id}', [EventController::class, 'show']);
    Route::get('/events/{event}/tickets', [TicketController::class, 'index']);
    Route::get('/events/{event}/tickets/{ticket}', [TicketController::class, 'show']);

    // Authenticated routes (session guard)
    Route::middleware('auth')->group(function () {
        // Authenticated user routes
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
        Route::put('/user/password', [AuthController::class, 'updatePassword']);

        // Bookings
        Route::get('/bookings', [BookingController::class, 'index']);
        Route::get('/bookings/upcoming', [BookingController::class, 'upcoming']);
        Route::get('/bookings/past', [BookingController::class, 'past']);
        Route::get('/bookings/{id}', [BookingController::class, 'show']);
        Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);

        // Favorites
        Route::get('/favorites', [FavoriteController::class, 'index']);
        Route::post('/favorites/{eventId}', [FavoriteController::class, 'store']);
        Route::delete('/favorites/{eventId}', [FavoriteController::class, 'destroy']);
        Route::get('/favorites/{eventId}/check', [FavoriteController::class, 'check']);

        // Tickets (mutations)
        Route::post('/events/{event}/tickets', [TicketController::class, 'store']);
        Route::put('/events/{event}/tickets/{ticket}', [TicketController::class, 'update']);
        Route::delete('/events/{event}/tickets/{ticket}', [TicketController::class, 'destroy']);
        Route::post('/events/{event}/tickets/{ticket}/reserve', [TicketController::class, 'reserve']);

        // Events (mutations)
        Route::post('/events', [EventController::class, 'store']);
        Route::put('/events/{id}', [EventController::class, 'update']);
        Route::delete('/events/{id}', [EventController::class, 'destroy']);
    });
});
