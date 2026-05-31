import { ok } from '@/utils/response';

export async function GET() {
  return ok({ status: 'ok', service: 'taskedprofit-api', time: new Date().toISOString() });
}
