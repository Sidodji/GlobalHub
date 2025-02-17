import {
  Button,
  Col,
  Collapse,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  TimeRangePickerProps,
  Typography,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { BudgetItemsFiltersModel } from '../../../models/budgetItem/filterForm/budgetItemsFiltersModel';
import React, { ReactNode, useEffect, useState } from 'react';
import { BudgetItemsTableAggregationModel } from '../../../models/budgetItem/budgetItemsTable/budgetItemsTableAggregationModel';
import { SorterResult } from 'antd/lib/table/interface';
import { BudgetItemTableEntry } from '../../../models/budgetItem/budgetItemsTable/budgetItemsTableEntry';
import { BudgetItemOperationType, BudgetItemOperationTypeTitle } from '../../../enums/Budgets/budgetItemOperationType';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { isArray, toNumber } from 'lodash';
import { BudgetItemsRequestDto } from '../../../dto/budgetItems/budgetItemsRequestDto';
import { BudgetItemsPaginatedResponseDto } from '../../../dto/budgetItems/budgetItemsPaginatedResponseDto';
import { BudgetItemDto } from '../../../dto/budgets/budgetItemDto';
import { PlusOutlined } from '@ant-design/icons';
import { TagSelector } from '../../../components/tagSelector/TagSelector';
import { BudgetItemDrawer } from '../budgetItemDrawer/BudgetItemDrawer';
import { BudgetItemDrawerModel } from '../../../models/budgetItem/budgetItemDrawer/budgetItemDrawerModel';
import {
  mapBudgetItemDtoToTableEntry,
  mapBudgetItemTableEntryToDrawerModel,
  mapDrawerModelToBudgetItemCreateDto,
  mapDrawerModelToBudgetItemUpdateDto,
} from '../../../helpers/budgetItemHelper';
import dayjs from 'dayjs';
import { nameof } from '../../../helpers/objectHelper';
import { HttpStatusCode } from 'axios';
import useBudgetsItemsApi from '../../../hooks/api/useBudgetsItemsApi';
import { BudgetItemDrawerConfig } from '../../../models/budgets/budgetItemDrawer/budgetItemDrawerConfig';
import { AppTablePaginationConfig } from '../../../models/shared/tablePaginationConfig';
import { TagColor } from '../../../enums/shared/tagColor';
import { TagDto } from '../../../dto/budgetTags/tagDto';

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface BudgetItemTableProps {
  budgetId: number;
  budgetTags: TagDto[];
  onNewTagAdded: (newTag: TagDto) => void;
  triggerAnalyticStatsRecalculation: () => Promise<void>;
  triggerTagLimitsDataLoading: () => Promise<void>;
  setBudgetTags: (value: ((prevState: TagDto[]) => TagDto[]) | TagDto[]) => void;
}

// eslint-disable-next-line no-magic-numbers
const tablePageSizeOptions = [5, 10, 20, 50, 100];

const countOfDaysInWeek = 7;

const dateRangePickerPresets: TimeRangePickerProps['presets'] = [
  {
    label: 'This month',
    value: [dayjs().date(1).startOf('date'), dayjs().date(1).add(1, 'months').add(-1, 'days').endOf('date')],
  },
  {
    label: 'Last month',
    value: [dayjs().date(1).add(-1, 'months').startOf('date'), dayjs().date(1).add(-1, 'days').endOf('date')],
  },
  { label: 'Last 7 Days', value: [dayjs().add(-countOfDaysInWeek, 'days').startOf('date'), dayjs().endOf('date')] },
];

export const BudgetItemsTable = ({
  budgetId,
  budgetTags,
  triggerAnalyticStatsRecalculation,
  triggerTagLimitsDataLoading,
  onNewTagAdded,
  setBudgetTags,
}: BudgetItemTableProps): JSX.Element => {
  const [budgetItemsTableEntries, setBudgetItemsTableEntries] = useState<BudgetItemTableEntry[]>([]);
  const [filtersForm] = useForm<BudgetItemsFiltersModel>();
  const budgetItemsApi = useBudgetsItemsApi();

  const [budgetItemTableAggregationModel, setBudgetItemTableAggregationModel] =
    useState<BudgetItemsTableAggregationModel>({
      totalIncoming: '0',
      totalExpenses: '0',
    });

  const [budgetItemsPaginationConfig, setBudgetItemsPaginationConfig] = useState<AppTablePaginationConfig>({
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 0,
  });

  const [budgetItemDrawerConfig, setBudgetItemDrawerConfig] = useState<BudgetItemDrawerConfig>({
    title: 'Budget Item',
    isDrawerOpened: false,
    isFormDisabled: false,
    initFormValues: undefined,
  });

  const initializeBudgetItemsTable = (budgetItemsDto: BudgetItemsPaginatedResponseDto): void => {
    const budgetItemEntries = budgetItemsDto.budgetItems.map(
      (dto: BudgetItemDto): BudgetItemTableEntry => mapBudgetItemDtoToTableEntry(dto)
    );

    setBudgetItemsTableEntries(budgetItemEntries);
    setBudgetItemTableAggregationModel({
      totalIncoming: budgetItemsDto.totalIncoming,
      totalExpenses: budgetItemsDto.totalExpenses,
    });
    setBudgetItemsPaginationConfig((prevState) => ({
      ...prevState,
      totalItems: budgetItemsDto.totalItems,
    }));
  };

  const onBudgetItemTitleClick = (record: BudgetItemTableEntry): void => {
    const drawerModel = mapBudgetItemTableEntryToDrawerModel(record);

    setBudgetItemDrawerConfig((config) => ({
      ...config,
      title: 'Budget Item',
      isDrawerOpened: true,
      isFormDisabled: true,
      initFormValues: drawerModel,
    }));
  };

  const onBudgetItemCreateClick = (): void => {
    setBudgetItemDrawerConfig((config) => ({
      ...config,
      title: 'Create Budget Item',
      isDrawerOpened: true,
      isFormDisabled: false,
      initFormValues: undefined,
    }));
  };

  const onBudgetItemEditButtonClick = (record: BudgetItemTableEntry): void => {
    const drawerModel = mapBudgetItemTableEntryToDrawerModel(record);

    setBudgetItemDrawerConfig((config) => ({
      ...config,
      title: 'Edit Budget Item',
      isDrawerOpened: true,
      isFormDisabled: false,
      initFormValues: drawerModel,
    }));
  };

  const onBudgetItemDeleteButtonClick = async (record: BudgetItemTableEntry): Promise<void> => {
    const { status } = await budgetItemsApi.delete(record.key);

    if (status !== HttpStatusCode.Ok) return;

    setBudgetItemsTableEntries((prevState) => prevState.filter((entry) => entry.key !== record.key));
    await Promise.all([triggerAnalyticStatsRecalculation(), triggerTagLimitsDataLoading()]);
  };

  const columns: ColumnsType<BudgetItemTableEntry> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'ItemTitle',
      render: (text: string, record: BudgetItemTableEntry, _): ReactNode => (
        <a onClick={(): void => onBudgetItemTitleClick(record)}>{text}</a>
      ),
      ellipsis: true,
      sorter: true,
    },
    {
      title: 'Operation type',
      dataIndex: 'operationType',
      key: 'BudgetItemOperationType',
      sorter: true,
      render: (value: BudgetItemOperationType) => <>{BudgetItemOperationTypeTitle[value]}</>,
    },
    {
      title: 'Operation Cost',
      dataIndex: 'operationCost',
      key: 'OperationCost',
      sorter: true,
    },
    {
      title: 'Tags',
      key: 'tags',
      dataIndex: 'tags',
      render: (_: void, { tagIds }: { tagIds: number[] }) => (
        <>
          {tagIds.map((tagId: number) => {
            const tagDto = budgetTags.filter((dto: TagDto) => dto.id === tagId)[0];
            const color = TagColor[tagDto?.color ?? TagColor.Default];

            return (
              tagDto && (
                <Tag color={color} key={tagDto.id}>
                  {tagDto.label}
                </Tag>
              )
            );
          })}
        </>
      ),
    },
    {
      title: 'Operation Date',
      dataIndex: 'operationDate',
      key: 'OperationDate',
      render: (data: Date) => data.toLocaleString(),
      sorter: true,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record: BudgetItemTableEntry): ReactNode => (
        <>
          <Button type={'link'} onClick={(): void => onBudgetItemEditButtonClick(record)}>
            Edit
          </Button>
          <Popconfirm
            onConfirm={(): Promise<void> => onBudgetItemDeleteButtonClick(record)}
            title={'Delete budget item'}
            description={'Sure to delete budget item?'}
            placement={'bottomRight'}
          >
            <Button type={'link'} danger>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  const getBudgetItemRequestDto = (
    currentPage?: number,
    countItemsPerPage?: number,
    sortColumn?: string,
    sortInAscendingOrder: boolean = true
  ): BudgetItemsRequestDto => {
    const filtersFormData = filtersForm.getFieldsValue();

    const filtersData = {
      title: filtersFormData.budgetItemTitle,
      tagIds: filtersFormData.budgetTagIds,
      startDateRange: filtersFormData.budgetItemDateRange && filtersFormData.budgetItemDateRange[0],
      endDateRange: filtersFormData.budgetItemDateRange && filtersFormData.budgetItemDateRange[1],
      budgetItemOperationType: filtersFormData.budgetItemOperationType,
    };

    const paginationData = {
      pageNumber: (currentPage ?? budgetItemsPaginationConfig.currentPage) - 1,
      itemsPerPageCount: countItemsPerPage ?? budgetItemsPaginationConfig.itemsPerPage,
    };

    const sortingData = {
      sortColumn: sortColumn,
      sortByAscending: sortInAscendingOrder,
    };

    return {
      ...paginationData,
      ...sortingData,
      filterModelDto: {
        ...filtersData,
      },
    };
  };

  const onTableChange = async (
    paginationConfig: TablePaginationConfig,
    sorterConfig: SorterResult<BudgetItemTableEntry> | SorterResult<BudgetItemTableEntry>[]
  ): Promise<void> => {
    sorterConfig = isArray(sorterConfig) ? sorterConfig[0] : sorterConfig;

    const requestDto = getBudgetItemRequestDto(
      paginationConfig.current,
      paginationConfig.pageSize,
      sorterConfig.column ? sorterConfig.columnKey?.toString() : undefined,
      sorterConfig.order === 'ascend'
    );

    const { data: budgetItemsResponse } = await budgetItemsApi.getFiltered(toNumber(budgetId), requestDto);
    initializeBudgetItemsTable(budgetItemsResponse);
  };

  const onSearchButtonClick = async (): Promise<void> => {
    const requestDto = getBudgetItemRequestDto();
    const { data: budgetItemsResponse } = await budgetItemsApi.getFiltered(toNumber(budgetId), requestDto);
    initializeBudgetItemsTable(budgetItemsResponse);
  };

  const resetFiltersForm = (): void => {
    filtersForm.resetFields();
  };

  const loadBudgetItems = async (): Promise<void> => {
    const requestDto = getBudgetItemRequestDto();

    const { data: budgetItemsResponse } = await budgetItemsApi.getFiltered(toNumber(budgetId), requestDto);
    initializeBudgetItemsTable(budgetItemsResponse);
  };

  useEffect(() => {
    loadBudgetItems();
  }, [budgetId]);

  const onBudgetItemFormSubmit = async (submittedData: BudgetItemDrawerModel): Promise<void> => {
    if (submittedData.budgetItemId) {
      const updateDto = mapDrawerModelToBudgetItemUpdateDto(submittedData, budgetId, submittedData.budgetItemId);
      await budgetItemsApi.update(updateDto);
    } else {
      const createDto = mapDrawerModelToBudgetItemCreateDto(submittedData, budgetId);
      await budgetItemsApi.create(createDto);
    }

    await Promise.all([loadBudgetItems(), triggerAnalyticStatsRecalculation(), triggerTagLimitsDataLoading()]);
  };

  const onBudgetItemDrawerClose = (): void => {
    setBudgetItemDrawerConfig((config) => ({
      ...config,
      isDrawerOpened: false,
      initFormValues: undefined,
    }));
  };

  const onTagRemoved = (removedTagId: number): void => {
    setBudgetItemsTableEntries((prevState) =>
      prevState.map((budgetItemTableEntry) => ({
        ...budgetItemTableEntry,
        tagIds: budgetItemTableEntry.tagIds.filter((id) => id !== removedTagId),
      }))
    );
  };

  return (
    <>
      <Collapse
        size="small"
        items={[
          {
            label: 'Filters',
            forceRender: true,
            children: (
              <Form form={filtersForm} size={'small'} layout="horizontal" title="Filters">
                <Row>
                  <Col span={8} offset={2}>
                    <Form.Item name={nameof<BudgetItemsFiltersModel>('budgetItemTitle')} label={'By title'}>
                      <Input placeholder="Input title" />
                    </Form.Item>
                    <Form.Item name={nameof<BudgetItemsFiltersModel>('budgetTagIds')} label={'By tags'}>
                      <TagSelector tags={budgetTags} />
                    </Form.Item>
                  </Col>
                  <Col span={8} offset={4}>
                    <Form.Item
                      name={nameof<BudgetItemsFiltersModel>('budgetItemDateRange')}
                      initialValue={dateRangePickerPresets[0].value}
                      label={'By date'}
                    >
                      <RangePicker
                        presets={dateRangePickerPresets}
                        showSecond={false}
                        showTime={{ format: 'HH:mm' }}
                        format="YYYY-MM-DD HH:mm"
                        style={{
                          width: '100%',
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      name={nameof<BudgetItemsFiltersModel>('budgetItemOperationType')}
                      label={'By operation type'}
                    >
                      <Select
                        allowClear
                        placeholder={'Select operation type'}
                        options={[
                          { value: BudgetItemOperationType.Incoming, label: 'Incoming' },
                          { value: BudgetItemOperationType.Outgoing, label: 'Outgoing' },
                        ]}
                      />
                    </Form.Item>
                    <div style={{ textAlign: 'right' }}>
                      <Space size="small">
                        <Button onClick={onSearchButtonClick} type="primary" htmlType="submit">
                          Search
                        </Button>
                        <Button onClick={resetFiltersForm}>Clear</Button>
                      </Space>
                    </div>
                  </Col>
                </Row>
              </Form>
            ),
          },
        ]}
      />
      <Table
        sortDirections={['ascend', 'descend']}
        sticky
        onChange={(
          pagination,
          _,
          sorter: SorterResult<BudgetItemTableEntry> | SorterResult<BudgetItemTableEntry>[]
        ): Promise<void> => onTableChange(pagination, sorter)}
        scroll={{ y: '55vh' }}
        showSorterTooltip={false}
        summary={(): ReactNode => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={6}>
                <Button block icon={<PlusOutlined />} onClick={onBudgetItemCreateClick}>
                  Add new item
                </Button>
              </Table.Summary.Cell>
            </Table.Summary.Row>
            <Table.Summary.Row>
              <Table.Summary.Cell index={1}>
                <Text strong>Effective balance:</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2}>
                <Text strong>Total incoming: {budgetItemTableAggregationModel.totalIncoming} BYN</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={3}>
                <Text strong>Total expenses: {budgetItemTableAggregationModel.totalExpenses} BYN</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
        size={'small'}
        columns={columns}
        pagination={{
          size: 'small',
          total: budgetItemsPaginationConfig.totalItems,
          pageSizeOptions: tablePageSizeOptions,
          showSizeChanger: true,
          defaultPageSize: budgetItemsPaginationConfig?.itemsPerPage,
          onChange: (pageNumber: number, pageSize: number): void => {
            setBudgetItemsPaginationConfig((config) => ({
              ...config,
              itemsPerPage: pageSize,
              currentPage: pageNumber,
            }));
          },
        }}
        dataSource={budgetItemsTableEntries}
      />
      <BudgetItemDrawer
        title={budgetItemDrawerConfig.title}
        onSubmitCallback={onBudgetItemFormSubmit}
        budgetItemTags={budgetTags}
        budgetId={budgetId}
        onNewTagAdded={onNewTagAdded}
        onFormCloseCallback={onBudgetItemDrawerClose}
        isDrawerOpened={budgetItemDrawerConfig.isDrawerOpened}
        initFormValues={budgetItemDrawerConfig.initFormValues}
        isDisabled={budgetItemDrawerConfig.isFormDisabled}
        setBudgetTags={setBudgetTags}
        onTagRemoved={onTagRemoved}
      />
    </>
  );
};
