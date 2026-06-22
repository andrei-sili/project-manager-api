from rest_framework import serializers

from apps.comments.models import Comment

# How many levels of nested replies to serialize. Beyond this, replies are
# truncated to avoid unbounded recursion and N+1 queries on deep threads.
MAX_REPLY_DEPTH = 4


class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'user_name', 'text', 'created_at', 'replies']

    def get_user_name(self, obj) -> str:
        return f"{obj.user.first_name} {obj.user.last_name}"

    def get_replies(self, obj) -> list:
        depth = self.context.get("reply_depth", 0)
        if depth >= MAX_REPLY_DEPTH:
            return []
        return CommentSerializer(
            obj.replies.all(),
            many=True,
            context={**self.context, "reply_depth": depth + 1},
        ).data


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['text', 'parent']

    def validate(self, data):
        parent = data.get("parent")
        task = self.context["view"].get_task()

        if parent and parent.task_id != task.id:
            raise serializers.ValidationError("Parent comment must belong to the same task.")
        return data