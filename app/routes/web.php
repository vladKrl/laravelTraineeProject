<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Taken from the old project as a reference
// Via copying this basit template new CRUD pages will be created
// Route::group(['namespace' => 'Object','prefix' => 'objects'], function(){
//     Route::get('/', 'IndexController')->name('admin.object.index');
//     Route::get('/create', 'CreateController')->name('admin.object.create');
//     Route::post('/', 'StoreController')->name('admin.object.store');
//     Route::get('/{object}', 'ShowController')->name('admin.object.show');
//     Route::get('/{object}/edit', 'EditController')->name('admin.object.edit');
//     Route::patch('/{object}', 'UpdateController')->name('admin.object.update');
//     Route::delete('/{object}', 'DestroyController')->name('admin.object.delete');
// });
