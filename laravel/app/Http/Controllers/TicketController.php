<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\Event;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TicketController extends Controller
{
    /**
     * Store a newly created ticket in storage.
     */
    public function store(Request $request, $eventId)
    {
        // Only admin can create tickets
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action.'
            ], 403);
        }

        $event = Event::findOrFail($eventId);

        $validator = Validator::make($request->all(), [
            'type' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'sale_starts_at' => 'nullable|date',
            'sale_ends_at' => 'nullable|date|after:sale_starts_at',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $ticket = new Ticket($validator->validated());
        $ticket->event_id = $event->id;
        $ticket->available_quantity = $request->quantity;
        $ticket->save();

        return response()->json([
            'success' => true,
            'message' => 'Ticket created successfully.',
            'data' => $ticket
        ], 201);
    }

    /**
     * Display the specified ticket.
     */
    public function show($eventId, $id)
    {
        $ticket = Ticket::where('event_id', $eventId)->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $ticket
        ]);
    }

    /**
     * Update the specified ticket in storage.
     */
    public function update(Request $request, $eventId, $id)
    {
        // Only admin can update tickets
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action.'
            ], 403);
        }

        $ticket = Ticket::where('event_id', $eventId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'type' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'sale_starts_at' => 'nullable|date',
            'sale_ends_at' => 'nullable|date|after:sale_starts_at',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $ticket->update($validator->validated());
        
        // Update available quantity if total quantity changed
        if ($request->has('quantity')) {
            $reserved = $ticket->quantity - $ticket->available_quantity;
            $ticket->available_quantity = $request->quantity - $reserved;
            $ticket->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Ticket updated successfully.',
            'data' => $ticket
        ]);
    }

    /**
     * Remove the specified ticket from storage.
     */
    public function destroy($eventId, $id)
    {
        // Only admin can delete tickets
        if (!Auth::check() || Auth::user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action.'
            ], 403);
        }

        $ticket = Ticket::where('event_id', $eventId)->findOrFail($id);
        
        // Check if tickets have been sold
        if ($ticket->available_quantity < $ticket->quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete ticket with active reservations.'
            ], 400);
        }

        $ticket->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ticket deleted successfully.'
        ]);
    }

    /**
     * Reserve/Book a ticket.
     */
    public function reserve(Request $request, $eventId, $id)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'You must be logged in to reserve tickets.'
            ], 401);
        }

        $ticket = Ticket::where('event_id', $eventId)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $quantity = $request->quantity;

        // Check if sales have started
        if ($ticket->sale_starts_at && now()->lt($ticket->sale_starts_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket sales have not started yet.'
            ], 400);
        }

        // Check if sales have ended
        if ($ticket->sale_ends_at && now()->gt($ticket->sale_ends_at)) {
            return response()->json([
                'success' => false,
                'message' => 'Ticket sales have ended.'
            ], 400);
        }

        // Check availability
        if ($ticket->available_quantity < $quantity) {
            return response()->json([
                'success' => false,
                'message' => 'Not enough tickets available.'
            ], 400);
        }

        // Reserve tickets
        $ticket->available_quantity -= $quantity;
        $ticket->save();

        // Create reservation record (you'll need a Reservation model)
        // For now, we'll just return success
        
        return response()->json([
            'success' => true,
            'message' => 'Tickets reserved successfully.',
            'data' => [
                'ticket' => $ticket,
                'quantity' => $quantity,
                'total_price' => $ticket->price * $quantity
            ]
        ]);
    }
}