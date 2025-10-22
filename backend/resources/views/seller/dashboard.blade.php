@extends('layouts.app')

@section('title', 'Seller Dashboard')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">Seller Dashboard</div>

                <div class="card-body">
                    @if (session('status'))
                        <div class="alert alert-success" role="alert">
                            {{ session('status') }}
                        </div>
                    @endif

                    <div class="alert alert-success">
                        Welcome back, {{ Auth::user()->userFirstName }}! You are logged in as a Seller.
                    </div>

                    <div class="mt-4">
                        <h4>Seller Tools:</h4>
                        <ul class="list-group">
                            <li class="list-group-item">Manage Products</li>
                            <li class="list-group-item">View Orders</li>
                            <li class="list-group-item">Sales Analytics</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
