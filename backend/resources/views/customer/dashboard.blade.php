@extends('layouts.app')

@section('title', 'Customer Dashboard')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">Customer Dashboard</div>

                <div class="card-body">
                    @if (session('status'))
                        <div class="alert alert-success" role="alert">
                            {{ session('status') }}
                        </div>
                    @endif

                    <div class="alert alert-success">
                        Hello, {{ Auth::user()->userFirstName }}! Welcome to your customer dashboard.
                    </div>

                    <div class="mt-4">
                        <h4>Your Account:</h4>
                        <ul class="list-group">
                            <li class="list-group-item">View Orders</li>
                            <li class="list-group-item">Wishlist</li>
                            <li class="list-group-item">Account Settings</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
