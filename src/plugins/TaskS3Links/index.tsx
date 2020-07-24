import React from 'react';
import { Plugin, PluginInit } from '..';

import PropertyTable from '../../components/PropertyTable';
import InformationRow from '../../components/InformationRow';

const extractBucketAndPath = (s3Url: string) => {
  const url = s3Url.replace('s3://', '').split('/');
  const bucket = url[0];
  const path = url.slice(1).join('/');
  return { bucket, path };
};

const plugin: PluginInit = ({ t }): Plugin => {
  return {
    'task-view': {
      sections: [
        {
          key: 'links',
          order: 1.1,
          label: t('label'),
          component: ({ artifacts }) => {
            const s3Artifacts = (artifacts || []).filter(
              (artifact) => artifact?.ds_type === 's3' && (artifact?.location || '').startsWith('s3://'),
            );
            if (s3Artifacts.length === 0) {
              return null;
            }

            return (
              <InformationRow spaceless>
                <PropertyTable
                  items={s3Artifacts || []}
                  columns={[
                    { label: t('fields.artifact-name') + ':', prop: 'name' },
                    {
                      label: t('fields.http') + ':',
                      accessor: (item) => {
                        const { bucket, path } = extractBucketAndPath(item.location);
                        const httpEndpoint = `http://${bucket}.s3-website-us-west-1.amazonaws.com/${path}`;
                        return (
                          <a href={httpEndpoint} target="_blank" rel="noopener noreferrer">
                            {httpEndpoint}
                          </a>
                        );
                      },
                    },
                    {
                      label: t('fields.console') + ':',
                      accessor: (item) => {
                        const { bucket, path } = extractBucketAndPath(item.location);
                        const awsConsoleEndpoint = `https://s3.console.aws.amazon.com/s3/buckets/${bucket}/${path}`;
                        return (
                          <a href={awsConsoleEndpoint} target="_blank" rel="noopener noreferrer">
                            {awsConsoleEndpoint}
                          </a>
                        );
                      },
                    },
                    { label: t('fields.content-type') + ':', prop: 'content_type' },
                  ]}
                />
              </InformationRow>
            );
          },
        },
      ],
    },
  };
};

export default {
  name: 'task.s3',
  translations: {
    en: {
      label: 'Links',
      fields: {
        'artifact-name': 'Artifact name',
        http: 'HTTP',
        console: 'AWS Console',
        'content-type': 'Content type',
      },
    },
  },
  plugin: plugin,
};
