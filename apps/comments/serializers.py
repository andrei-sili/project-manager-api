from rest_framework import serializers

from apps.comments.models import Comment


class RecursiveField(serializers.Serializer):
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data


class CommentSerializer(serializers.ModelSerializer):
    replies = RecursiveField(many=True, read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'user_name', 'text', 'created_at', 'replies']

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def validate(self, data):
        parent = data.get("parent")
        task = self.context["view"].get_task()

        if parent and parent.task_id != task.id:
            raise serializers.ValidationError("Parent comment must belong to the same task.")
        return data


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