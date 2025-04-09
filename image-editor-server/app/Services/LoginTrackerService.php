<?php

namespace App\Services;

use App\Models\LoginTracker;

class LoginTrackerService
{
    public static function createDetails($detailsData)
    {
        try {
              $details=LoginTracker::create($detailsData);

            return [
                'details' => $details,
            ];
            
        } catch (\Exception $e) {            
            return [
                'error' => $e->getMessage()];
        }
    }
}
