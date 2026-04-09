import { cn } from '@/lib/utils';

interface EmptyProps {
  message?: string;
}

export default function Empty({ message = '暂无数据' }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-gray-400 text-6xl mb-4">📋</div>
      <p className="text-gray-500 text-lg">{message}</p>
    </div>
  );
}
