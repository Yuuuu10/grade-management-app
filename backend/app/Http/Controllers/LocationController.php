<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    /**
     * 場所一覧取得
     */
    public function index(Request $request)
    {
        $locations = Location::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($locations);
    }

    /**
     * 場所作成
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $location = Location::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'address' => $request->address,
            'notes' => $request->notes,
        ]);

        return response()->json($location, 201);
    }

    /**
     * 場所詳細取得
     */
    public function show(Request $request, Location $location)
    {
        // 自分の場所かチェック
        if ($location->user_id !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        return response()->json($location);
    }

    /**
     * 場所更新
     */
    public function update(Request $request, Location $location)
    {
        // 自分の場所かチェック
        if ($location->user_id !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        $request->validate([
            'name' => 'string|max:255',
            'address' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $location->update($request->all());

        return response()->json($location);
    }

    /**
     * 場所削除
     */
    public function destroy(Request $request, Location $location)
    {
        // 自分の場所かチェック
        if ($location->user_id !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        $location->delete();

        return response()->json(['message' => '場所を削除しました']);
    }
}
