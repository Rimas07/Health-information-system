import { HttpProxyServer } from '../../src/proxy/http-proxy-server';

describe('HttpProxyServer', () => {

    describe('validateQuerySafety', () => {

        it('пропускает безопасный запрос', () => {
            const proxy = new (HttpProxyServer as any)(null, null, null, null, null, null, null, null);

            expect(() => {
                (proxy as any).validateQuerySafety({ operation: 'find', filter: { name: 'Иван' } })
            }).not.toThrow();
        })

        it('блокирует запрос с $where', () => {
            const proxy = new (HttpProxyServer as any)(null, null, null, null, null, null, null, null);

            expect(() => {
                (proxy as any).validateQuerySafety({ filter: { '$where': 'while(true){}' } })
            }).toThrow('Forbidden operator: $where');
        })

    })
})
