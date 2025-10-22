@extends('layouts.app')

@section('title', 'Verify Your Account')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">Verify Your Account</div>

                <div class="card-body">
                    @if (session('success'))
                        <div class="alert alert-success" role="alert">
                            {{ session('success') }}
                        </div>
                    @endif

                    @if (session('error'))
                        <div class="alert alert-danger" role="alert">
                            {{ session('error') }}
                        </div>
                    @endif

                    <div class="row mb-4">
                        <div class="col-12">
                            <div class="alert alert-info">
                                <p class="mb-0">Thank you for registering! Please verify your email address and phone number to activate your account.</p>
                            </div>
                        </div>
                    </div>


                    <div class="row">
                        <!-- Email Verification -->
                        <div class="col-md-6 mb-4">
                            <div class="card h-100">
                                <div class="card-header bg-light">
                                    <h5 class="mb-0">Email Verification</h5>
                                </div>
                                <div class="card-body">
                                    @if (Auth::user()->hasVerifiedEmail())
                                        <div class="alert alert-success">
                                            <i class="fas fa-check-circle me-2"></i> Email verified successfully!
                                        </div>
                                    @else
                                        <p>We've sent a verification code to <strong>{{ Auth::user()->email }}</strong>.</p>
                                        <p>Please check your email and enter the code below:</p>
                                        
                                        <form method="POST" action="{{ route('verification.email') }}">
                                            @csrf
                                            <div class="mb-3">
                                                <label for="email_code" class="form-label">Verification Code</label>
                                                <input type="text" class="form-control @error('code') is-invalid @enderror" 
                                                       id="email_code" name="code" required autofocus>
                                                @error('code')
                                                    <span class="invalid-feedback" role="alert">
                                                        <strong>{{ $message }}</strong>
                                                    </span>
                                                @enderror
                                            </div>
                                            <button type="submit" class="btn btn-primary">
                                                Verify Email
                                            </button>
                                        </form>
                                        
                                        <div class="mt-3">
                                            <p class="mb-1">Didn't receive the code?</p>
                                            <form method="POST" action="{{ route('verification.email.resend') }}">
                                                @csrf
                                                <button type="submit" class="btn btn-link p-0">
                                                    Resend verification code
                                                </button>
                                            </form>
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </div>

                        <!-- Phone Verification -->
                        <div class="col-md-6 mb-4">
                            <div class="card h-100">
                                <div class="card-header bg-light">
                                    <h5 class="mb-0">Phone Verification</h5>
                                </div>
                                <div class="card-body">
                                    @if (Auth::user()->hasVerifiedPhone())
                                        <div class="alert alert-success">
                                            <i class="fas fa-check-circle me-2"></i> Phone number verified successfully!
                                        </div>
                                    @else
                                        <p>We've sent an SMS with a verification code to <strong>{{ Auth::user()->userContactNumber }}</strong>.</p>
                                        <p>Please enter the code below:</p>
                                        
                                        <form method="POST" action="{{ route('verification.phone') }}">
                                            @csrf
                                            <div class="mb-3">
                                                <label for="phone_code" class="form-label">Verification Code</label>
                                                <input type="text" class="form-control @error('code') is-invalid @enderror" 
                                                       id="phone_code" name="code" required>
                                                @error('code')
                                                    <span class="invalid-feedback" role="alert">
                                                        <strong>{{ $message }}</strong>
                                                    </span>
                                                @enderror
                                            </div>
                                            <button type="submit" class="btn btn-primary">
                                                Verify Phone
                                            </button>
                                        </form>
                                        
                                        <div class="mt-3">
                                            <p class="mb-1">Didn't receive the code?</p>
                                            <form method="POST" action="{{ route('verification.phone.resend') }}">
                                                @csrf
                                                <button type="submit" class="btn btn-link p-0">
                                                    Resend verification code
                                                </button>
                                            </form>
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>

                    @if (Auth::user()->hasVerifiedEmail() && Auth::user()->hasVerifiedPhone())
                        <div class="text-center mt-4">
                            <a href="{{ route('home') }}" class="btn btn-success">
                                Continue to Dashboard
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
