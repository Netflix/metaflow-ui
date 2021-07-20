# Template plugin

Renders custom values in UI that are pointed from metaflow flow definition file.

## Setup

Requires "allow-same-origin" sandbox flag for plugin parameters.

## How to use

Needs helper function in metaflow runs like

```python
from metaflow import FlowSpec, current
from collections import namedtuple
MetaDatum = namedtuple('MetaDatum', 'field value type tags')

def template(flow: FlowSpec, template_name: str, obj: object):
    flow._datastore.metadata.register_metadata(
        current.run_id,
        current.step_name,
        current.task_id,
        [MetaDatum(
            field='template-plugin',
            value=json.dumps(obj),
            type="template:{}".format(template_name),
            tags=['template-plugin']
        )]
    )
```

Which can be used like

```python
@step
def prepare_regular_step(self):
  template(self, 'print-object', {"value": 10500, "other_value": "something else"})
```

This example would pick print-object.html template and render it to task details section.
