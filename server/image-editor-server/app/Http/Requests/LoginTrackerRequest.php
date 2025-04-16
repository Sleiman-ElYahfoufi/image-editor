<?php

namespace App\Http\Requests;

use App\Traits\ResponseTrait;
use Illuminate\Foundation\Http\FormRequest;

class LoginTrackerRequest extends FormRequest
{    use ResponseTrait;

    /**
     * Determine if the user is authorized to make this request.
     */


    public function authorize(): bool{
        return true;
    }
    public function rules(): array{
        return [
            "user_id" => "required|exists:users,id",
            "ip_address" => "required|ip",
            "latitude" => 'required|numeric|between:-90,90',
            "longitude" => 'required|numeric|between:-180,180',
        ];
    }

    public function messages():array{
        return [
            "ip_address.required" => "Your IP address is required!",
        ];
    }

    public function attributes(): array{
        return [
            "ip_address" => "IP Address",
            "latitude" => "Latitude",
            "longitude" => "Longitude"
        ];
    }
}
