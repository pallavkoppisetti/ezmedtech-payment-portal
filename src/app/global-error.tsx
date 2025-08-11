'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Something went wrong!
                </CardTitle>
                <CardDescription>
                  An unexpected error has occurred.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Please try refreshing the page or contact support if the problem persists.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button onClick={() => reset()}>
                    Try again
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Go Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </body>
    </html>
  );
}
