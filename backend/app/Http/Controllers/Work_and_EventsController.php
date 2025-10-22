<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use \Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\Work_and_Events;
use Illuminate\Support\Facades\Log;

class Work_and_EventsController extends Controller
{

       // check if the user is a seller
       private function checkSeller()
       {
           $user = Auth::user();
           if (!$user) {
               return response()->json(['message' => 'Unauthenticated'], 401);
           }
           
           $seller = $user->seller;
           if (!$seller) {
               return response()->json(['message' => 'User is not a seller'], 403);
           }
           
           return $seller;
       }

    public function addWorkAndEvents(Request $request)
    {
        $seller = $this->checkSeller();
        if ($seller instanceof JsonResponse) {
            return $seller;
        }

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
            'link' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'date' => 'required|date',
            'time' => 'required|string',
            'participants' => 'required|integer|min:0',
            'status' => 'required|string|in:upcoming,ongoing,completed,cancelled',
            'existingImage' => 'nullable|string',
            'existingLink' => 'nullable|string',
            'mainImageIndex' => 'nullable|integer',
            'mainLinkIndex' => 'nullable|integer',
        ]);

        try {
            // Set the seller_id from the authenticated seller
            $data['seller_id'] = $seller->sellerID;

            // Handle image upload
            if ($request->hasFile('image')) {
                $data['image'] = $request->file('image')->store('work_and_events', 'public');
                Log::info('Work and Events image uploaded:', ['path' => $data['image']]);
            }

            // Create the work and events record
            $workAndEvent = Work_and_Events::create($data);

            Log::info('Work and Events created successfully:', [
                'id' => $workAndEvent->works_and_events_id,
                'title' => $workAndEvent->title,
                'seller_id' => $workAndEvent->seller_id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Work and Events created successfully',
                'data' => [
                    'id' => $workAndEvent->works_and_events_id,
                    'title' => $workAndEvent->title,
                    'description' => $workAndEvent->description,
                    'image_url' => $workAndEvent->image_url,
                    'link' => $workAndEvent->link,
                    'location' => $workAndEvent->location,
                    'date' => $workAndEvent->date,
                    'time' => $workAndEvent->time,
                    'participants' => $workAndEvent->participants,
                    'status' => $workAndEvent->status,
                    'seller_id' => $workAndEvent->seller_id,
                    'created_at' => $workAndEvent->created_at,
                    'updated_at' => $workAndEvent->updated_at
                ]
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating Work and Events:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create Work and Events',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display a listing of work and events for the authenticated seller
     */
    public function index()
    {
        $seller = $this->checkSeller();
        if ($seller instanceof JsonResponse) {
            return $seller;
        }

        try {
            $workAndEvents = Work_and_Events::where('seller_id', $seller->sellerID)
                ->with(['seller.user'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($item) {
                    return [
                        'works_and_events_id' => $item->works_and_events_id,
                        'title' => $item->title,
                        'description' => $item->description,
                        'image_url' => $item->image_url,
                        'link' => $item->link,
                        'location' => $item->location,
                        'date' => $item->date,
                        'time' => $item->time,
                        'participants' => $item->participants,
                        'status' => $item->status,
                        'seller_id' => $item->seller_id,
                        'seller' => $item->seller ? [
                            'sellerID' => $item->seller->sellerID ?? null,
                            'businessName' => $item->seller->businessName ?? null,
                            'user' => $item->seller->user ? [
                                'userID' => $item->seller->user->userID ?? null,
                                'userName' => $item->seller->user->userName ?? null,
                                'userEmail' => $item->seller->user->userEmail ?? null,
                                'userCity' => $item->seller->user->userCity ?? null,
                                'userProvince' => $item->seller->user->userProvince ?? null,
                            ] : null
                        ] : null,
                        'created_at' => $item->created_at,
                        'updated_at' => $item->updated_at
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $workAndEvents
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching work and events:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'seller_id' => $seller->sellerID ?? 'unknown'
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch work and events',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage
     */
    public function store(Request $request)
    {
        return $this->addWorkAndEvents($request);
    }

    /**
     * Display the specified resource
     */
    public function show($id)
    {
        $seller = $this->checkSeller();
        if ($seller instanceof JsonResponse) {
            return $seller;
        }

        try {
            $workAndEvent = Work_and_Events::where('works_and_events_id', $id)
                ->where('seller_id', $seller->sellerID)
                ->with(['seller.user'])
                ->first();

            if (!$workAndEvent) {
                return response()->json([
                    'success' => false,
                    'message' => 'Work and Event not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'works_and_events_id' => $workAndEvent->works_and_events_id,
                    'title' => $workAndEvent->title,
                    'description' => $workAndEvent->description,
                    'image_url' => $workAndEvent->image_url,
                    'link' => $workAndEvent->link,
                    'location' => $workAndEvent->location,
                    'date' => $workAndEvent->date,
                    'time' => $workAndEvent->time,
                    'participants' => $workAndEvent->participants,
                    'status' => $workAndEvent->status,
                    'seller_id' => $workAndEvent->seller_id,
                    'seller' => [
                        'sellerID' => $workAndEvent->seller->sellerID ?? null,
                        'businessName' => $workAndEvent->seller->businessName ?? null,
                        'user' => [
                            'userID' => $workAndEvent->seller->user->userID ?? null,
                            'userName' => $workAndEvent->seller->user->userName ?? null,
                            'userEmail' => $workAndEvent->seller->user->userEmail ?? null,
                            'userCity' => $workAndEvent->seller->user->userCity ?? null,
                            'userProvince' => $workAndEvent->seller->user->userProvince ?? null,
                        ]
                    ],
                    'created_at' => $workAndEvent->created_at,
                    'updated_at' => $workAndEvent->updated_at
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching work and event:', [
                'error' => $e->getMessage(),
                'id' => $id,
                'seller_id' => $seller->sellerID
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch work and event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage
     */
    public function update(Request $request, $id)
    {
        $seller = $this->checkSeller();
        if ($seller instanceof JsonResponse) {
            return $seller;
        }

        try {
            $workAndEvent = Work_and_Events::where('works_and_events_id', $id)
                ->where('seller_id', $seller->sellerID)
                ->first();

            if (!$workAndEvent) {
                return response()->json([
                    'success' => false,
                    'message' => 'Work and Event not found'
                ], 404);
            }

            $data = $request->validate([
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'image' => 'sometimes|image|mimes:jpeg,png,jpg,gif,svg|max:5120',
                'link' => 'sometimes|string|max:255',
                'location' => 'sometimes|string|max:255',
                'date' => 'sometimes|date',
                'time' => 'sometimes|string',
                'participants' => 'sometimes|integer|min:0',
                'status' => 'sometimes|string|in:upcoming,ongoing,completed,cancelled',
            ]);

            // Handle image upload if provided
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($workAndEvent->image) {
                    \Storage::disk('public')->delete($workAndEvent->image);
                }
                $data['image'] = $request->file('image')->store('work_and_events', 'public');
            }

            $workAndEvent->update($data);

            Log::info('Work and Events updated successfully:', [
                'id' => $workAndEvent->works_and_events_id,
                'seller_id' => $workAndEvent->seller_id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Work and Event updated successfully',
                'data' => [
                    'works_and_events_id' => $workAndEvent->works_and_events_id,
                    'title' => $workAndEvent->title,
                    'description' => $workAndEvent->description,
                    'image_url' => $workAndEvent->image_url,
                    'link' => $workAndEvent->link,
                    'location' => $workAndEvent->location,
                    'date' => $workAndEvent->date,
                    'time' => $workAndEvent->time,
                    'participants' => $workAndEvent->participants,
                    'status' => $workAndEvent->status,
                    'seller_id' => $workAndEvent->seller_id,
                    'created_at' => $workAndEvent->created_at,
                    'updated_at' => $workAndEvent->updated_at
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating work and event:', [
                'error' => $e->getMessage(),
                'id' => $id,
                'seller_id' => $seller->sellerID
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update work and event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage
     */
    public function destroy($id)
    {
        $seller = $this->checkSeller();
        if ($seller instanceof JsonResponse) {
            return $seller;
        }

        try {
            $workAndEvent = Work_and_Events::where('works_and_events_id', $id)
                ->where('seller_id', $seller->sellerID)
                ->first();

            if (!$workAndEvent) {
                return response()->json([
                    'success' => false,
                    'message' => 'Work and Event not found'
                ], 404);
            }

            // Delete associated image if exists
            if ($workAndEvent->image) {
                \Storage::disk('public')->delete($workAndEvent->image);
            }

            $workAndEvent->delete();

            Log::info('Work and Events deleted successfully:', [
                'id' => $id,
                'seller_id' => $seller->sellerID
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Work and Event deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting work and event:', [
                'error' => $e->getMessage(),
                'id' => $id,
                'seller_id' => $seller->sellerID
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete work and event',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Legacy methods for backward compatibility
    public function getAllWorkAndEvents()
    {
        return $this->index();
    }

    public function getWorkAndEventById($id)
    {
        return $this->show($id);
    }

    public function updateWorkAndEvent(Request $request, $id)
    {
        return $this->update($request, $id);
    }

    /**
     * Get all work and events for public viewing (customers can see who created each event)
     */
    public function getPublicWorkAndEvents()
    {
        try {
            $workAndEvents = Work_and_Events::with(['seller.user'])
                ->where('status', '!=', 'cancelled')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($item) {
                    return [
                        'works_and_events_id' => $item->works_and_events_id,
                        'title' => $item->title,
                        'description' => $item->description,
                        'image_url' => $item->image_url,
                        'link' => $item->link,
                        'location' => $item->location,
                        'date' => $item->date,
                        'time' => $item->time,
                        'participants' => $item->participants,
                        'status' => $item->status,
                        'seller' => [
                            'sellerID' => $item->seller->sellerID ?? null,
                            'businessName' => $item->seller->businessName ?? null,
                            'user' => [
                                'userID' => $item->seller->user->userID ?? null,
                                'userName' => $item->seller->user->userName ?? null,
                                'userEmail' => $item->seller->user->userEmail ?? null,
                                'userCity' => $item->seller->user->userCity ?? null,
                                'userProvince' => $item->seller->user->userProvince ?? null,
                            ]
                        ],
                        'created_at' => $item->created_at,
                        'updated_at' => $item->updated_at
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $workAndEvents
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching public work and events:', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch work and events',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get specific work and event for public viewing
     */
    public function getPublicWorkAndEventById($id)
    {
        try {
            $workAndEvent = Work_and_Events::where('works_and_events_id', $id)
                ->with(['seller.user'])
                ->first();

            if (!$workAndEvent) {
                return response()->json([
                    'success' => false,
                    'message' => 'Work and Event not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'works_and_events_id' => $workAndEvent->works_and_events_id,
                    'title' => $workAndEvent->title,
                    'description' => $workAndEvent->description,
                    'image_url' => $workAndEvent->image_url,
                    'link' => $workAndEvent->link,
                    'location' => $workAndEvent->location,
                    'date' => $workAndEvent->date,
                    'time' => $workAndEvent->time,
                    'participants' => $workAndEvent->participants,
                    'status' => $workAndEvent->status,
                    'seller' => [
                        'sellerID' => $workAndEvent->seller->sellerID ?? null,
                        'businessName' => $workAndEvent->seller->businessName ?? null,
                        'user' => [
                            'userID' => $workAndEvent->seller->user->userID ?? null,
                            'userName' => $workAndEvent->seller->user->userName ?? null,
                            'userEmail' => $workAndEvent->seller->user->userEmail ?? null,
                            'userCity' => $workAndEvent->seller->user->userCity ?? null,
                            'userProvince' => $workAndEvent->seller->user->userProvince ?? null,
                        ]
                    ],
                    'created_at' => $workAndEvent->created_at,
                    'updated_at' => $workAndEvent->updated_at
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching public work and event:', [
                'error' => $e->getMessage(),
                'id' => $id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch work and event',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    


}


