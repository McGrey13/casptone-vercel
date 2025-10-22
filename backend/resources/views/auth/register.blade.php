@extends('layouts.app')

@section('title', 'Register')

@section('content')
<div class="row justify-content-center">
    <div class="col-md-6">
        <div class="card">
            <div class="card-header">
                <h4 class="mb-0">Register</h4>
            </div>
            <div class="card-body">
                @if($errors->any())
                    <div class="alert alert-danger">
                        <ul class="mb-0">
                            @foreach($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </div>
                @endif

                <form method="POST" action="{{ route('register') }}">
                    @csrf
                    
                    <div class="mb-3">
                        <label for="userType" class="form-label">Register As</label>
                        <select class="form-select @error('userType') is-invalid @enderror" id="userType" name="userType" required>
                            <option value="" selected disabled>Select account type</option>
                            <option value="customer" {{ old('userType') == 'customer' ? 'selected' : '' }}>Customer</option>
                            <option value="seller" {{ old('userType') == 'seller' ? 'selected' : '' }}>Seller</option>
                            <option value="admin" {{ old('userType') == 'admin' ? 'selected' : '' }}>Admin</option>
                        </select>
                        @error('userType')
                            <span class="invalid-feedback" role="alert">
                                <strong>{{ $message }}</strong>
                            </span>
                        @enderror
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="userFirstName" class="form-label">First Name</label>
                            <input id="userFirstName" type="text" class="form-control @error('userFirstName') is-invalid @enderror" name="userFirstName" value="{{ old('userFirstName') }}" required autocomplete="given-name" autofocus>
                            @error('userFirstName')
                                <span class="invalid-feedback" role="alert">
                                    <strong>{{ $message }}</strong>
                                </span>
                            @enderror
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="userLastName" class="form-label">Last Name</label>
                            <input id="userLastName" type="text" class="form-control @error('userLastName') is-invalid @enderror" name="userLastName" value="{{ old('userLastName') }}" required autocomplete="family-name">
                            @error('userLastName')
                                <span class="invalid-feedback" role="alert">
                                    <strong>{{ $message }}</strong>
                                </span>
                            @enderror
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="email" class="form-label">Email Address</label>
                        <input id="email" type="email" class="form-control @error('email') is-invalid @enderror" name="email" value="{{ old('email') }}" required autocomplete="email">
                        @error('email')
                            <span class="invalid-feedback" role="alert">
                                <strong>{{ $message }}</strong>
                            </span>
                        @enderror
                    </div>

                    <div class="mb-3">
                        <label for="password" class="form-label">Password</label>
                        <input id="password" type="password" class="form-control @error('password') is-invalid @enderror" name="password" required autocomplete="new-password">
                        @error('password')
                            <span class="invalid-feedback" role="alert">
                                <strong>{{ $message }}</strong>
                            </span>
                        @enderror
                    </div>

                    <div class="mb-3">
                        <label for="password-confirm" class="form-label">Confirm Password</label>
                        <input id="password-confirm" type="password" class="form-control" name="password_confirmation" required autocomplete="new-password">
                    </div>

                    <div class="mb-3">
                        <label for="userContactNumber" class="form-label">Contact Number</label>
                        <input id="userContactNumber" type="text" class="form-control @error('userContactNumber') is-invalid @enderror" name="userContactNumber" value="{{ old('userContactNumber') }}" required>
                        @error('userContactNumber')
                            <span class="invalid-feedback" role="alert">
                                <strong>{{ $message }}</strong>
                            </span>
                        @enderror
                    </div>

                    <div class="mb-3">
                        <label for="userAddress" class="form-label">Address</label>
                        <textarea id="userAddress" class="form-control @error('userAddress') is-invalid @enderror" name="userAddress" rows="2" required>{{ old('userAddress') }}</textarea>
                        @error('userAddress')
                            <span class="invalid-feedback" role="alert">
                                <strong>{{ $message }}</strong>
                            </span>
                        @enderror
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="userAge" class="form-label">Age</label>
                            <input id="userAge" type="number" class="form-control @error('userAge') is-invalid @enderror" name="userAge" value="{{ old('userAge') }}" required>
                            @error('userAge')
                                <span class="invalid-feedback" role="alert">
                                    <strong>{{ $message }}</strong>
                                </span>
                            @enderror
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="userBirthDay" class="form-label">Birthday</label>
                            <input id="userBirthDay" type="date" class="form-control @error('userBirthDay') is-invalid @enderror" name="userBirthDay" value="{{ old('userBirthDay') }}" required>
                            @error('userBirthDay')
                                <span class="invalid-feedback" role="alert">
                                    <strong>{{ $message }}</strong>
                                </span>
                            @enderror
                        </div>
                    </div>

                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-primary">
                            {{ __('Register') }}
                        </button>
                    </div>

                    <div class="text-center mt-3">
                        Already have an account? <a href="{{ route('login') }}">Login here</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
