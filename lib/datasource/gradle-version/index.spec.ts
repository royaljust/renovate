import fs from 'fs';
import * as httpMock from '../../../test/httpMock';
import * as gradleVersion from '.';

const allResponse: any = fs.readFileSync(
  'lib/datasource/gradle-version/__fixtures__/all.json'
);

let config: any = {};

describe('datasource/gradle-version', () => {
  describe('getReleases', () => {
    beforeEach(() => {
      config = {
        lookupName: 'abc',
      };
      jest.clearAllMocks();
      httpMock.setup();
    });

    afterEach(() => {
      httpMock.reset();
    });

    it('processes real data', async () => {
      httpMock
        .scope('https://services.gradle.org/')
        .get('/versions/all')
        .reply(200, JSON.parse(allResponse));
      const res = await gradleVersion.getReleases(config);
      expect(res).toMatchSnapshot();
      expect(res).not.toBeNull();
      expect(httpMock.getTrace()).toMatchSnapshot();
    });

    it('calls configured registryUrls', async () => {
      httpMock
        .scope('https://foo.bar')
        .get('/')
        .reply(200, JSON.parse(allResponse));

      httpMock
        .scope('http://baz.qux')
        .get('/')
        .reply(200, JSON.parse(allResponse));

      const res = await gradleVersion.getReleases({
        ...config,
        registryUrls: ['https://foo.bar', 'http://baz.qux'],
      });
      // This will have every release duplicated, because we used the same
      // mocked data for both responses.
      expect(res).toMatchSnapshot();
      expect(res).not.toBeNull();
      expect(httpMock.getTrace()).toMatchSnapshot();
    });
  });
});
