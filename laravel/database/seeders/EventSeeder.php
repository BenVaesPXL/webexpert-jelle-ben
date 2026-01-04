<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\User;
use Carbon\Carbon;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@test.be')->first();

        $eventsData = [
            [
                'title' => 'Tech Conference 2025',
                'description' => 'Een conferentie over web, AI en cloud.',
                'location' => 'Antwerpen',
                'start_offset' => 10,
                'duration_hours' => 8,
            ],
            [
                'title' => 'Music Festival',
                'description' => 'Live muziek met verschillende artiesten.',
                'location' => 'Gent',
                'start_offset' => 20,
                'duration_hours' => 12,
            ],
            [
                'title' => 'Startup Meetup',
                'description' => 'Netwerken met startups en investeerders.',
                'location' => 'Brussel',
                'start_offset' => 30,
                'duration_hours' => 6,
            ],
            [
                'title' => 'Design Workshop',
                'description' => 'Hands-on workshop over UI/UX design.',
                'location' => 'Antwerpen',
                'start_offset' => 12,
                'duration_hours' => 5,
            ],
            [
                'title' => 'Photography Expo',
                'description' => 'Tentoonstelling van hedendaagse fotografie.',
                'location' => 'Gent',
                'start_offset' => 15,
                'duration_hours' => 6,
            ],
            [
                'title' => 'Food Truck Festival',
                'description' => 'Proef de lekkerste gerechten van food trucks.',
                'location' => 'Brussel',
                'start_offset' => 25,
                'duration_hours' => 8,
            ],
            [
                'title' => 'Gaming Convention',
                'description' => 'Alles over de nieuwste games en technologie.',
                'location' => 'Antwerpen',
                'start_offset' => 18,
                'duration_hours' => 10,
            ],
            [
                'title' => 'Literature Festival',
                'description' => 'Lezingen en workshops met auteurs.',
                'location' => 'Gent',
                'start_offset' => 28,
                'duration_hours' => 7,
            ],
            [
                'title' => 'Charity Run',
                'description' => 'Loop mee voor het goede doel.',
                'location' => 'Brussel',
                'start_offset' => 35,
                'duration_hours' => 4,
            ],
        ];

        foreach ($eventsData as $data) {
            Event::create([
                'title' => $data['title'],
                'description' => $data['description'],
                'location' => $data['location'],
                'start_date' => Carbon::now()->addDays($data['start_offset'])->addHours(9),
                'end_date' => Carbon::now()->addDays($data['start_offset'])->addHours(9 + $data['duration_hours']),
                'owner_id' => $admin->id,
            ]);
        }
    }
}
