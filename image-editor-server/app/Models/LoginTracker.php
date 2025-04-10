<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
class LoginTracker extends Model
{

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
                ];
    }

    public function user(){
        return $this->belongsTo(User::class);
    }
}
