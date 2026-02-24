<?php

use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Auth\Register;

Route::get('/', function () {
    return view('welcome');
});

Route::post('/login', function (Request $request) {
    $credentials = $request->validate([
        'email' => ['required', 'email'],
        'password' => ['required'],
    ]);

    if (Auth::attempt($credentials)) {
        $request->session()->regenerate();
        return response()->noContent();
    }

    return response()->json([
        'errors' => [
            'email' => ['The provided credentials do not match our records.']
        ]
    ], 422);
});

Route::post('/logout', function (Request $request) {
    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return response()->noContent();
});

Route::post('/register', Register::class)
    ->middleware('guest');

Route::get('/email/verify/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();
    return redirect('http://localhost:3000/?verified=1');
})->middleware(['auth', 'signed'])->name('verification.verify');

Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return response()->json(['status' => 'verification-link-sent']);
})->middleware(['auth', 'throttle:6,1'])->name('verification.send');

/*
 Taken from the old project as a reference
 Via copying this basit template new CRUD pages will be created
 Route::group(['namespace' => 'Object','prefix' => 'objects'], function(){
     Route::get('/', 'IndexController')->name('admin.object.index');
     Route::get('/create', 'CreateController')->name('admin.object.create');
     Route::post('/', 'StoreController')->name('admin.object.store');
     Route::get('/{object}', 'ShowController')->name('admin.object.show');
     Route::get('/{object}/edit', 'EditController')->name('admin.object.edit');
     Route::patch('/{object}', 'UpdateController')->name('admin.object.update');
     Route::delete('/{object}', 'DestroyController')->name('admin.object.delete');
 });
*/
