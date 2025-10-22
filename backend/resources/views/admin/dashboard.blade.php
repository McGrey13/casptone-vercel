@extends('layouts.app')

@section('title', 'Admin Dashboard')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">Admin Dashboard</div>

                <div class="card-body">
                    @if (session('status'))
                        <div class="alert alert-success" role="alert">
                            {{ session('status') }}
                        </div>
                    @endif

                    <div class="alert alert-success">
                        Welcome, {{ Auth::user()->userFirstName }}! You are logged in as Administrator.
                    </div>

                    <div class="mt-4">
                        <h4>Admin Controls:</h4>
                        <ul class="list-group">
                            <li class="list-group-item">Manage Users</li>
                            <li class="list-group-item">View Reports</li>
                            <li class="list-group-item">System Settings</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
