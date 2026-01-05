<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Carbon\Carbon;

class EventController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $includeDrafts = $request->boolean('include_drafts', false);

        // Only show drafts when explicitly requested by an admin (for admin panel)
        $query = Event::with('tickets')->orderBy('start_date');
        if (!($user && $user->role === 'admin' && $includeDrafts)) {
            $query->where('is_published', true);
        }

        $events = $query->get();

        return response()->json([
            'success' => true,
            'data' => $events
        ]);
    }

    public function show($id)
    {
        // Haal het event op, inclusief alle tickets (gesorteerd op prijs)
        $event = Event::with([
            'tickets' => function ($q) {
                $q->orderBy('price');
            }
        ])->findOrFail($id);

        $user = auth()->user();
        if ((!$user || $user->role !== 'admin') && !$event->is_published) {
            abort(404);
        }

        // Geeft event details terug, inclusief tickets
        return response()->json([
            'success' => true,
            'data' => [
                'event' => $event,
            ]
        ]);
    }

    /**
     * Store a newly created event in storage.
     */
    public function store(Request $request)
    {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action.'
            ], 403);
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'location' => ['required', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'max:2048'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'is_published' => ['sometimes', 'boolean'],
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('events', 'public');
            $data['image'] = $path;
        }

        $event = Event::create([
            ...$data,
            'owner_id' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'data' => $event,
        ], 201);
    }

    /**
     * Update the specified event in storage.
     */
    public function update(Request $request, $id)
    {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action.'
            ], 403);
        }

        $event = Event::findOrFail($id);

        $startDateInput = $request->input('start_date');

        $data = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'location' => ['sometimes', 'required', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'max:2048'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => [
                'sometimes',
                'required',
                'date',
                function ($attribute, $value, $fail) use ($startDateInput, $event) {
                    $start = $startDateInput ?? $event->start_date;
                    if ($start && Carbon::parse($value)->lt(Carbon::parse($start))) {
                        $fail('The end date must be after or equal to start date.');
                    }
                },
            ],
            'is_published' => ['sometimes', 'boolean'],
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('events', 'public');
            $data['image'] = $path;
        }

        $event->update($data);

        return response()->json([
            'success' => true,
            'data' => $event,
        ]);
    }

    /**
     * Remove the specified event from storage.
     */
    public function destroy($id)
    {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action.'
            ], 403);
        }

        $event = Event::findOrFail($id);
        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event deleted.',
        ]);
    }
}
