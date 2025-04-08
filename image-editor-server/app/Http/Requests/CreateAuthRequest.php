<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Traits\ResponseTrait;

class CreateAuthRequest extends FormRequest
{
    use ResponseTrait;


    public function authorize(): bool{
        return true;
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function rules(): array{
        return [
            "email" => "required|email",
            "password" => "required|min:8",
        ];
    }

    public function messages():array{
        return [
            "email.required" => "Your email is required!",
            "password.required" => "Password is needed!",
        ];
    }

    public function attributes(): array{
        return [
            "email" => "Email Address"
        ];
    }

}
