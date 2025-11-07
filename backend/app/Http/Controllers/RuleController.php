<?php

namespace App\Http\Controllers;

use App\Models\Rule;
use Illuminate\Http\Request;

class RuleController extends Controller
{
    /**
     * ルール一覧取得
     */
    public function index(Request $request)
    {
        $rules = Rule::where('user_id', $request->user()->id)
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($rules);
    }

    /**
     * ルール作成
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'starting_points' => 'required|integer',
            'return_points' => 'required|integer',
            'uma_1' => 'required|integer',
            'uma_2' => 'required|integer',
            'uma_3' => 'required|integer',
            'uma_4' => 'required|integer',
            'oka' => 'required|integer',
            'is_default' => 'boolean',
        ]);

        // デフォルトルールの場合、他のデフォルトを解除
        if ($request->is_default) {
            Rule::where('user_id', $request->user()->id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $rule = Rule::create([
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'starting_points' => $request->starting_points,
            'return_points' => $request->return_points,
            'uma_1' => $request->uma_1,
            'uma_2' => $request->uma_2,
            'uma_3' => $request->uma_3,
            'uma_4' => $request->uma_4,
            'oka' => $request->oka,
            'is_default' => $request->is_default ?? false,
        ]);

        return response()->json($rule, 201);
    }

    /**
     * ルール詳細取得
     */
    public function show(Request $request, Rule $rule)
    {
        // 自分のルールかチェック
        if ($rule->user_id !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        return response()->json($rule);
    }

    /**
     * ルール更新
     */
    public function update(Request $request, Rule $rule)
    {
        // 自分のルールかチェック
        if ($rule->user_id !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        $request->validate([
            'name' => 'string|max:255',
            'starting_points' => 'integer',
            'return_points' => 'integer',
            'uma_1' => 'integer',
            'uma_2' => 'integer',
            'uma_3' => 'integer',
            'uma_4' => 'integer',
            'oka' => 'integer',
            'is_default' => 'boolean',
        ]);

        // デフォルトルールの場合、他のデフォルトを解除
        if ($request->is_default) {
            Rule::where('user_id', $request->user()->id)
                ->where('id', '!=', $rule->id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $rule->update($request->all());

        return response()->json($rule);
    }

    /**
     * ルール削除
     */
    public function destroy(Request $request, Rule $rule)
    {
        // 自分のルールかチェック
        if ($rule->user_id !== $request->user()->id) {
            return response()->json(['message' => '権限がありません'], 403);
        }

        $rule->delete();

        return response()->json(['message' => 'ルールを削除しました']);
    }
}
