<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;

class BookingController extends Controller
{
    /**
     * Get all bookings for the authenticated user
     */
    public function index(Request $request)
    {
        $bookings = $request->user()
            ->bookings()
            ->with(['event', 'ticket'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }

    /**
     * Get upcoming bookings for the authenticated user
     */
    public function upcoming(Request $request)
    {
        $bookings = $request->user()
            ->bookings()
            ->with(['event', 'ticket'])
            ->whereHas('event', function ($query) {
                $query->where('start_date', '>=', now());
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }

    /**
     * Get past bookings for the authenticated user
     */
    public function past(Request $request)
    {
        $bookings = $request->user()
            ->bookings()
            ->with(['event', 'ticket'])
            ->whereHas('event', function ($query) {
                $query->where('end_date', '<', now());
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bookings
        ]);
    }

    /**
     * Get a specific booking
     */
    public function show(Request $request, $id)
    {
        $booking = $request->user()
            ->bookings()
            ->with(['event', 'ticket'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $booking
        ]);
    }

    /**
     * Cancel a booking
     */
    public function cancel(Request $request, $id)
    {
        $booking = $request->user()
            ->bookings()
            ->findOrFail($id);

        if ($booking->status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Booking is already cancelled'
            ], 400);
        }

        $booking->status = 'cancelled';
        $booking->save();

        $ticket = $booking->ticket;
        $ticket->quantity += $booking->quantity;
        $ticket->save();

        return response()->json([
            'success' => true,
            'message' => 'Booking cancelled successfully',
            'data' => $booking
        ]);
    }
}
