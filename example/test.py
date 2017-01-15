#!/usr/bin/env python3

import sys
import asyncio
import json
import numpy as np

ENVPORT = 12345

loop = asyncio.get_event_loop()

async def run(name):
    transport = None
    fail_cnt = 0
    while not transport and fail_cnt < 10:
        try:
            transport, _ = await loop.create_connection(asyncio.Protocol,
                                                        host='localhost',
                                                        port=ENVPORT)
        except OSError:
            print('failed to connect the env viewer, retry...')
            fail_cnt += 1
            await asyncio.sleep(1)
    if not transport:
        print('give up sending observation to the env viewer. :(')
        return
    transport.writelines([name.encode()])
    await asyncio.sleep(0.01)
    shape = (10, 10)
    transport.writelines([json.dumps(shape).encode()])
    await asyncio.sleep(0.01)
    FPS = 20
    while not transport.is_closing():
        try:
            data = (256 * np.random.rand(*shape, 3)).astype(np.uint8)
            transport.writelines([data.tobytes()])
            await asyncio.sleep(1 / FPS)
        except Exception:
            break

    if not transport.is_closing():
        transport.write_eof()

    print('bye')


if __name__ == '__main__':
    name = 'test'
    if len(sys.argv) > 1:
        name = sys.argv[1]
    try:
        loop.run_until_complete(run(name))
    except KeyboardInterrupt:
        pass

    loop.stop()
