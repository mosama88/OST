<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LanguageController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke($language)
    {
        if (in_array($language, ['en', 'ar'])) {
            session()->put('locale', $language);
        }
        return redirect()->back();
    }
}
