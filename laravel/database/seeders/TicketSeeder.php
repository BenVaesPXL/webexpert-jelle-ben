<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\Ticket;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        $events = Event::all();

        foreach ($events as $event) {
            $ticketTypes = [
                'Standard' => ['min_price' => 20, 'max_price' => 30, 'min_qty' => 0, 'max_qty' => 5000],
                'VIP' => ['min_price' => 50, 'max_price' => 120, 'min_qty' => 0, 'max_qty' => 3200],
                'Early Bird' => ['min_price' => 10, 'max_price' => 20, 'min_qty' => 0, 'max_qty' => 1000],
            ];

            foreach ($ticketTypes as $type => $info) {
                $quantity = rand($info['min_qty'], $info['max_qty']);
                $price = rand($info['min_price'] * 100, $info['max_price'] * 100) / 100;

                Ticket::create([
                    'event_id' => $event->id,
                    'type' => $type,
                    'price' => $price,
                    'quantity' => $quantity,
                ]);
            }
        }
    }
}
