@component('mail::layout')
    @slot('header')
        @component('mail::header', ['url' => config('app.url')])
            {{ config('app.name') }}
        @endcomponent
    @endslot

    # Hello {{ $name }},

    Thank you for registering with {{ config('app.name') }}. Please use the following verification code to verify your email address:

    @component('mail::panel')
        {{ $code }}
    @endcomponent

    This code will expire in 24 hours. If you did not create an account, no further action is required.

    @slot('footer')
        @component('mail::footer')
            © {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
        @endcomponent
    @endslot
@endcomponent
