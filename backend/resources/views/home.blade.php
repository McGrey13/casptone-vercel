@extends('layouts.app')

@section('title', 'Dashboard')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">Dashboard</div>

                <div class="card-body">
                    @if (session('status'))
                        <div class="alert alert-success" role="alert">
                            {{ session('status') }}
                        </div>
                    @endif

                    <div class="alert alert-success">
                        Welcome, {{ Auth::user()->userFirstName }}! You are logged in as {{ Auth::user()->userType }}.
                    </div>

                    <div class="mt-4">
                        <h4>User Information:</h4>
                        <p><strong>Name:</strong> {{ Auth::user()->userFirstName }} {{ Auth::user()->userLastName }}</p>
                        <p><strong>Email:</strong> {{ Auth::user()->email }}</p>
                        <p><strong>User Type:</strong> {{ ucfirst(Auth::user()->userType) }}</p>
                    </div>

                    <div class="mt-4">
                        <a href="{{ route('logout') }}" 
                           onclick="event.preventDefault(); document.getElementById('logout-form').submit();"
                           class="btn btn-danger">
                            Logout
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
